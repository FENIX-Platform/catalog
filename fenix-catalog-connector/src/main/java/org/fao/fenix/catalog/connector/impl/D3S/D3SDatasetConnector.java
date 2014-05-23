package org.fao.fenix.catalog.connector.impl.D3S;

import org.fao.fenix.catalog.connector.Connector;
import org.fao.fenix.catalog.connector.ConnectorImplementation;
import org.fao.fenix.commons.msd.dto.cl.Code;
import org.fao.fenix.commons.msd.dto.cl.CodeSystem;
import org.fao.fenix.commons.msd.dto.cl.type.DuplicateCodeException;
import org.fao.fenix.commons.msd.dto.dm.DM;
import org.fao.fenix.commons.msd.dto.dm.type.DMDataType;
import org.fao.fenix.commons.msd.dto.dm.type.DMLayerType;
import org.fao.fenix.commons.msd.dto.dsd.DSD;
import org.fao.fenix.commons.msd.dto.dsd.DSDColumn;
import org.fao.fenix.commons.search.dto.Response;
import org.fao.fenix.commons.search.dto.filter.ColumnValueFilter;
import org.fao.fenix.commons.search.dto.filter.Filter;
import org.fao.fenix.commons.search.dto.filter.QueryString;
import org.fao.fenix.commons.search.dto.filter.ResourceFilter;
import org.fao.fenix.commons.search.dto.resource.Resource;
import org.fao.fenix.commons.search.dto.resource.data.*;
import org.fao.fenix.commons.search.dto.resource.index.Index;
import org.fao.fenix.commons.search.dto.resource.index.IndexType;
import org.fao.fenix.d3s.client.D3SClient;
import org.fao.fenix.d3s.msd.services.spi.LoadCodeList;
import org.fao.fenix.d3s.search.dto.SearchFilter;
import org.fao.fenix.d3s.search.dto.SearchMetadataResponse;
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
                fillSearchFilter(filter,types,codes);
                Response d3sResponse = getProxy(Search.class,D3SServices.searchDataset.getPath()).getMetadataBasicAlgorithm(filter);
                if (d3sResponse!=null && d3sResponse.getCount()>0) {
                    for (Resource dataset : d3sResponse.getResources())
                        fillD3SDatasetResource(dataset);
                    resources.addAll(d3sResponse.getResources());
                }
            }
        }

        return resources.size()>0 ? resources : null;
    }


    //UTILS

    //Prepare request
    private void fillSearchFilter (Filter filter, Set<String> types, Collection<Code> codes) {
        //metadata and dimensions filter are compatible
        SearchFilter d3sFilter = new SearchFilter();
        d3sFilter.setFields(filter.getFilter().getMetadata());
        d3sFilter.setDimensions(filter.getFilter().getData());

        //Try to find using specific codes
        if (codes!=null)
            for (Code code : codes)
                d3sFilter.addDimensionFilter("ITEM", ColumnValueFilter.getCodeInstance(code));

        //add datType field
        if (types.contains("layer"))
            filter.addMetadataFilter("dataType", ColumnValueFilter.getEnumerationInstance(DMDataType.layer.getCode()));
        if (types.contains("dataset"))
            filter.addMetadataFilter("dataType", ColumnValueFilter.getEnumerationInstance(DMDataType.dataset.getCode()));
    }

    //Prepare response
    private void fillD3SDatasetResource(Resource resource) {
        Map<String,Object> indexReferences = new HashMap<>();
        indexReferences.put("url",getBasePath()+D3SServices.loadDataset.getPath()+'/'+resource.getName());
        indexReferences.put("method", "GET");
        indexReferences.put("Accept", "application/json");

        ((StandardData)resource).setIndex(new Index(IndexType.http,indexReferences));
    }


    private Resource fillResource(CodeSystem codeList) {
        if (codeList==null)
            return null;

        Map<String,Object> indexReferences = new HashMap<>();
        indexReferences.put("url",getBasePath()+D3SServices.loadCodelist.getPath()+"/system/"+codeList.getSystem()+'/'+codeList.getVersion());
        indexReferences.put("method", "GET");
        indexReferences.put("Accept", "application/json");
        Index index = new Index(IndexType.http,indexReferences);

        Collection<Code> data = codeList.getRootCodes();
        try { codeList.setRootCodes(null);
        } catch (DuplicateCodeException e) {
            throw new RuntimeException("Malformed code list data into database", e);
        }

        return new CodeListData(codeList.getSystem()+"-"+codeList.getVersion(), "codelist", "D3S", index, codeList, data, countCodes(data));

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
