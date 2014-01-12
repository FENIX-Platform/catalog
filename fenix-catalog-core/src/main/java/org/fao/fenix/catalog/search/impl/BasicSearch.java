package org.fao.fenix.catalog.search.impl;

import org.fao.fenix.catalog.connector.Connector;
import org.fao.fenix.catalog.connector.Connectors;
import org.fao.fenix.catalog.dto.*;
import org.fao.fenix.catalog.dto.data.Resource;
import org.fao.fenix.catalog.processing.Processor;

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
        for (Map.Entry<String, Collection<Connector>> connectorsMapEntry : connectors.entrySet()) {
            filter.getFilter().setTypes(new String[]{connectorsMapEntry.getKey()});
            for (Connector connector : connectorsMapEntry.getValue())
                for (Resource resource : connector.search(filter))
                    if ( (resource = resourcesProcessor!=null?resourcesProcessor.process(resource):resource) != null)
                        response.addResource(resource);
        }
        return responseProcessor!=null ? responseProcessor.process(response) : response;
    }


}
