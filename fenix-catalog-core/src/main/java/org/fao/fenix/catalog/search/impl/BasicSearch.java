package org.fao.fenix.catalog.search.impl;

import org.fao.fenix.catalog.connector.Connector;
import org.fao.fenix.catalog.connector.Connectors;
import org.fao.fenix.catalog.search.dto.Filter;
import org.fao.fenix.catalog.search.dto.Response;
import org.fao.fenix.catalog.search.dto.data.Resource;
import org.fao.fenix.catalog.processing.Processor;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import java.util.Collection;
import java.util.Map;

public class BasicSearch {


    @Inject Processor resourcesProcessor;
    @Inject Processor responseProcessor;
    @Inject Connectors connectors;


    //Search flow
    public Response search (Filter filter) throws Exception {
        connectors.init(filter.getFilter().getTypes());
        resourcesProcessor.init(filter.getFilter().getBusiness());
        responseProcessor.init(filter.getBusiness());

        Response response = new Response();
        for (Connector connector : connectors.getConnectors()) {
            Collection<Resource> resources = connector.search(filter);
            if (resources != null)
                for (Resource resource : resources)
                    if ( (resource = resourcesProcessor!=null?resourcesProcessor.process(resource):resource) != null)
                        response.addResource(resource);
        }
        return responseProcessor!=null ? responseProcessor.process(response) : response;
    }


}
