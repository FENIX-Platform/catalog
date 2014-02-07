package org.fao.fenix.catalog.connector.impl.D3S;

import org.fao.fenix.catalog.connector.Connector;
import org.fao.fenix.catalog.connector.ConnectorImplementation;
import org.fao.fenix.catalog.search.dto.Filter;
import org.fao.fenix.catalog.search.dto.ResourceFilter;
import org.fao.fenix.catalog.search.dto.data.*;
import org.fao.fenix.catalog.search.dto.data.dsd.ResourceDSD;
import org.fao.fenix.catalog.search.dto.data.dsd.TableDSD;
import org.fao.fenix.client.D3SClient;
import org.fao.fenix.msd.dto.cl.CodeSystem;
import org.fao.fenix.msd.dto.dm.DM;
import org.fao.fenix.msd.dto.dsd.DSD;
import org.fao.fenix.msd.dto.dsd.DSDColumn;
import org.fao.fenix.msd.services.spi.LoadCodeList;
import org.fao.fenix.search.dto.SearchDataResponse;
import org.fao.fenix.search.dto.SearchFilter;
import org.fao.fenix.search.dto.SearchMetadataResponse;
import org.fao.fenix.search.dto.SearchResponse;
import org.fao.fenix.search.services.spi.Search;

import javax.enterprise.context.RequestScoped;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Context;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

@ConnectorImplementation
@RequestScoped
public class D3SDatasetConnector extends D3SClient implements Connector {

    @Context private HttpServletRequest httpRequest;

    @Override
    public void init(Map<String,Object> properties) {
        initRest((String) properties.get("url"));
    }

    @Override
    public Collection<Resource> search(Filter filter) {
        try {
            //CodeSystem cl = getProxy(LoadCodeList.class,D3SServices.loadCodelist.getPath()).getCodeList("FAO_Languages", "1.0", false);
            //System.out.println("Letta la codifica: " + cl.getSystem());
            ResourceFilter resourcesFilter = filter.getFilter();
            if (resourcesFilter!=null) {
                SearchFilter d3sFilter = new SearchFilter();
                d3sFilter.setFields(filter.getFilter().getMetadata());
                d3sFilter.setDimensions(filter.getFilter().getData());

                SearchMetadataResponse d3sResponse = (SearchMetadataResponse)getProxy(Search.class,D3SServices.searchDataset.getPath()).getMetadataBasicAlgorithm(d3sFilter);
                if (d3sResponse!=null && d3sResponse.getCount()>0) {
                    Collection<Resource> resources = new LinkedList<>();
                    for (DM dataset : d3sResponse.getDatasets())
                        resources.add(createResource(dataset,null));
                    return resources;
                }
            }
        } catch (Exception e) {
            e.printStackTrace(); //TODO errors management
        }
        return null;
    }



    private Resource createResource (DM metadata, Collection<Object[]> data) {
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
