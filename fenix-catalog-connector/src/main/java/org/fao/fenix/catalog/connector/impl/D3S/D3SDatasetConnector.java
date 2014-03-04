package org.fao.fenix.catalog.connector.impl.D3S;

import org.fao.fenix.catalog.connector.Connector;
import org.fao.fenix.catalog.connector.ConnectorImplementation;
import org.fao.fenix.catalog.search.dto.Filter;
import org.fao.fenix.catalog.search.dto.QueryString;
import org.fao.fenix.catalog.search.dto.ResourceFilter;
import org.fao.fenix.catalog.search.dto.resource.*;
import org.fao.fenix.catalog.search.dto.resource.data.CodeListData;
import org.fao.fenix.catalog.search.dto.resource.data.DataType;
import org.fao.fenix.catalog.search.dto.resource.data.LayerData;
import org.fao.fenix.catalog.search.dto.resource.data.TableData;
import org.fao.fenix.catalog.search.dto.resource.dsd.CodeListDSD;
import org.fao.fenix.catalog.search.dto.resource.dsd.LayerDSD;
import org.fao.fenix.catalog.search.dto.resource.dsd.TableDSD;
import org.fao.fenix.catalog.search.dto.resource.index.Index;
import org.fao.fenix.catalog.search.dto.resource.index.IndexType;
import org.fao.fenix.d3s.client.D3SClient;
import org.fao.fenix.d3s.msd.dto.cl.Code;
import org.fao.fenix.d3s.msd.dto.cl.CodeSystem;
import org.fao.fenix.d3s.msd.dto.dm.DM;
import org.fao.fenix.d3s.msd.dto.dm.type.DMDataType;
import org.fao.fenix.d3s.msd.dto.dm.type.DMLayerType;
import org.fao.fenix.d3s.msd.dto.dsd.DSD;
import org.fao.fenix.d3s.msd.dto.dsd.DSDColumn;
import org.fao.fenix.d3s.msd.services.spi.LoadCodeList;
import org.fao.fenix.d3s.search.dto.SearchFilter;
import org.fao.fenix.d3s.search.dto.SearchMetadataResponse;
import org.fao.fenix.d3s.search.dto.valueFilters.ColumnValueFilter;
import org.fao.fenix.d3s.search.services.spi.Search;

import javax.enterprise.context.RequestScoped;
import java.util.*;

@ConnectorImplementation
@RequestScoped
public class D3SDatasetConnector extends D3SClient implements Connector {

    @Override
    public void init(Map<String,Object> properties) {
        initRest((String) properties.get("url"));
    }

    @Override
    public Collection<Resource> search(Filter filter) throws Exception {
        Collection<Resource> resources = new LinkedList<>();

        ResourceFilter resourcesFilter = filter.getFilter();
        if (resourcesFilter!=null) {
            //Search depending on resourceType
            ResourceFilter resourceFilter = filter.getFilter();
            String[] resourceTypes = resourceFilter!=null ? resourceFilter.getTypes() : null;
            Set<String> types = new HashSet<>(Arrays.asList(resourceTypes!=null && resourceTypes.length>0 ? resourceTypes : new String[]{"dataset","layer","codelist"}));
            QueryString freeTextField = resourceFilter!=null ? resourceFilter.getQueryString() : null;
            String query = freeTextField!=null ? freeTextField.getQuery() : null;

            //Search for compatible codes
            Collection<Code> codes = null;
            LoadCodeList clLoadProxy = getProxy(LoadCodeList.class,D3SServices.loadCodelist.getPath());
            if (query!=null && !query.trim().equals("")) {
                String language = freeTextField.getLanguage();
                codes = clLoadProxy.getCodesByTitle(language != null ? language : "EN", freeTextField.getQuery());
            }

            //Search for codelists
            if (types.contains("codelist") && codes!=null) {
                Set<SystemKey> codelistsKey = new HashSet<>();
                for (Code code : codes)
                    codelistsKey.add(new SystemKey(code.getSystemKey(), code.getSystemVersion()));
                for (SystemKey key : codelistsKey)
                    resources.add(fillResource(clLoadProxy.getCodeList(key.getSystem(),key.getVersion(),false)));
            }

            //Search for D3S datasets and layers
            if (types.contains("dataset") || types.contains("layer")) {
                SearchMetadataResponse d3sResponse = getProxy(Search.class,D3SServices.searchDataset.getPath()).getMetadataBasicAlgorithm(fillSearchFilter(filter,types,codes));
                if (d3sResponse!=null && d3sResponse.getCount()>0)
                    for (DM dataset : d3sResponse.getDatasets())
                        resources.add(fillResource(dataset, null));
            }
        }

        return resources.size()>0 ? resources : null;
    }


    //UTILS

    //Prepare request
    private SearchFilter fillSearchFilter (Filter filter, Set<String> types, Collection<Code> codes) {
        //metadata and dimensions filter are compatible
        SearchFilter d3sFilter = new SearchFilter();
        d3sFilter.setFields(filter.getFilter().getMetadata());
        d3sFilter.setDimensions(filter.getFilter().getData());

        //Try to find specific codes
        if (codes!=null)
            for (Code code : codes)
                d3sFilter.addDimensionFilter("ITEM",new ColumnValueFilter(code));

        //add datType field
        if (types.contains("layer")) {
            ColumnValueFilter dataType = new ColumnValueFilter();
            dataType.setEnumeration(DMDataType.layer.getCode());
            d3sFilter.addFieldFilter("dataType", dataType);
        }
        if (types.contains("dataset")) {
            ColumnValueFilter dataType = new ColumnValueFilter();
            dataType.setEnumeration(DMDataType.dataset.getCode());
            d3sFilter.addFieldFilter("dataType", dataType);
        }
        //Return filter
        return d3sFilter;
    }

    //Prepare response
    private Resource fillResource(DM metadata, Object data) {
        Map<String,Object> indexReferences = new HashMap<>();
        indexReferences.put("url",getBasePath()+D3SServices.loadDataset.getPath()+'/'+metadata.getUid());
        indexReferences.put("method", "GET");
        indexReferences.put("Accept", "application/json");
        Index index = new Index(IndexType.http,indexReferences);

        if (metadata.getDataType() == DMDataType.dataset) {
            Collection<Object[]> tableData = (Collection<Object[]>)data;
            DSD d3sDSD = metadata.getDsd();
            TableDSD dsd = new TableDSD();
            if (d3sDSD!=null) {
                for (DSDColumn d3sColumn : d3sDSD.getColumns())
                    dsd.put(d3sColumn.getDimension().getName(), d3sColumn);
            }
            return new TableData(metadata.getUid(), "dataset", "D3S", index, metadata, dsd, tableData, tableData!=null ? tableData.size() : 0);
        }

        if (metadata.getDataType() == DMDataType.layer) {
            LayerDSD dsd = new LayerDSD();
            DataType dataType = metadata.getLayerType()==DMLayerType.raster ? DataType.raster : DataType.vector;
            Integer size = null; //TODO define data size
            return new LayerData(metadata.getUid(), "layer", "D3S", index, dataType, metadata, dsd, data, size);
        }

        return null;
    }


    private Resource fillResource(CodeSystem codeList) {
        if (codeList==null)
            return null;

        Map<String,Object> indexReferences = new HashMap<>();
        indexReferences.put("url",getBasePath()+D3SServices.loadCodelist.getPath()+"/system/"+codeList.getSystem()+'/'+codeList.getVersion());
        indexReferences.put("method", "GET");
        indexReferences.put("Accept", "application/json");
        Index index = new Index(IndexType.http,indexReferences);

        int levelsNumber = codeList.getLevelsNumber()!=null?codeList.getLevelsNumber():0;
        CodeListDSD dsd = levelsNumber>1 ? new CodeListDSD(CodeListDSD.CodeListStructure.tree) : new CodeListDSD(CodeListDSD.CodeListStructure.list);
        Collection<Code> data = codeList.getRootCodes();
        codeList.setRootCodes(null);
        codeList.setLevelsNumber(levelsNumber);

        return new CodeListData(codeList.getSystem()+"-"+codeList.getVersion(), "codelist", "D3S", index, codeList, dsd, data, countCodes(data));

    }

    private static int countCodes(Collection<Code> codes) {
        int count = 0;
        if (codes!=null) {
            count+=codes.size();
            for (Code code : codes)
                count+=countCodes(code.getChilds());
        }
        return count;
    }

}
