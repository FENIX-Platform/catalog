package org.fao.fenix.catalog.connector.impl.D3S;

import org.fao.fenix.catalog.connector.Connector;
import org.fao.fenix.catalog.connector.ConnectorImplementation;
import org.fao.fenix.catalog.search.dto.Filter;
import org.fao.fenix.catalog.search.dto.ResourceFilter;
import org.fao.fenix.catalog.search.dto.data.*;
import org.fao.fenix.catalog.search.dto.data.dsd.TableDSD;
import org.fao.fenix.client.D3SClient;
import org.fao.fenix.msd.dto.dm.DM;
import org.fao.fenix.msd.dto.dm.type.DMDataType;
import org.fao.fenix.msd.dto.dsd.DSD;
import org.fao.fenix.msd.dto.dsd.DSDColumn;
import org.fao.fenix.search.dto.SearchFilter;
import org.fao.fenix.search.dto.SearchMetadataResponse;
import org.fao.fenix.search.dto.valueFilters.ColumnValueFilter;
import org.fao.fenix.search.services.spi.Search;

import javax.enterprise.context.RequestScoped;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Context;
import java.util.*;

@ConnectorImplementation
@RequestScoped
public class D3SDatasetConnector extends D3SClient implements Connector {

    @Context private HttpServletRequest httpRequest;

    @Override
    public void init(Map<String,Object> properties) {
        initRest((String) properties.get("url"));
    }

    @Override
    public Collection<Resource> search(Filter filter) throws Exception {
        Collection<Resource> resources = new LinkedList<>();
        try {
            ResourceFilter resourcesFilter = filter.getFilter();
            if (resourcesFilter!=null) {
                //Search depending on resourceType
                String[] resourceTypes = filter.getFilter().getTypes();
                Set<String> types = new HashSet<>(Arrays.asList(resourceTypes!=null && resourceTypes.length>0 ? resourceTypes : new String[]{"dataset","layer","codelist"}));

                //Search for D3S datasets
                if (types.contains("dataset") || types.contains("layer")) {
                    SearchMetadataResponse d3sResponse = (SearchMetadataResponse)getProxy(Search.class,D3SServices.searchDataset.getPath()).getMetadataBasicAlgorithm(fillSearchFilter(filter,types));
                    if (d3sResponse!=null && d3sResponse.getCount()>0)
                        for (DM dataset : d3sResponse.getDatasets())
                            resources.add(fillResource(dataset, null));
                }


            }
        } catch (Exception e) {
            e.printStackTrace(); //TODO errors management
        }
        return resources.size()>0 ? resources : null;
    }


    //UTILS

    //Prepare request
    private SearchFilter fillSearchFilter (Filter filter, Set<String> types) {
        //metadata and dimensions filter are compatible
        SearchFilter d3sFilter = new SearchFilter();
        d3sFilter.setFields(filter.getFilter().getMetadata());
        d3sFilter.setDimensions(filter.getFilter().getData());
        //add datType field
        if (types.contains("layer")) {
            ColumnValueFilter dataType = new ColumnValueFilter();
            dataType.setEnumeration(DMDataType.map.getCode());
            d3sFilter.addFieldFilter("dataType",dataType);
            dataType = new ColumnValueFilter();
            dataType.setEnumeration(DMDataType.raster.getCode());
            d3sFilter.addFieldFilter("dataType",dataType);
            dataType = new ColumnValueFilter();
            dataType.setEnumeration(DMDataType.vector.getCode());
            d3sFilter.addFieldFilter("dataType",dataType);
        }
        if (types.contains("dataset")) {
            ColumnValueFilter dataType = new ColumnValueFilter();
            dataType.setEnumeration(DMDataType.dataset.getCode());
            d3sFilter.addFieldFilter("dataType",dataType);
        }
        //Return filter
        return d3sFilter;
    }

    //Prepare response
    private Resource fillResource(DM metadata, Collection<Object[]> data) {
        Map<String,Object> indexReferences = new HashMap<>();
        indexReferences.put("url",getBasePath()+D3SServices.loadDataset.getPath()+'/'+metadata.getUid());
        indexReferences.put("method", "GET");
        indexReferences.put("Accept", "application/json");
        Index index = new Index(IndexType.http,indexReferences);

        DSD d3sDSD = metadata.getDsd();
        TableDSD dsd = new TableDSD();
        if (d3sDSD!=null) {
            metadata.setDsd(null);
            for (DSDColumn d3sColumn : d3sDSD.getColumns())
                dsd.put(d3sColumn.getDimension().getName(), d3sColumn);
        }

        return new TableData(metadata.getUid(), "dataset", "D3S", index, metadata, dsd, data, data!=null ? data.size() : 0);
    }
}
