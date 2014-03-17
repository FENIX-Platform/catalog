package org.fao.fenix.catalog.search.impl;

import org.fao.fenix.catalog.connector.Connector;
import org.fao.fenix.catalog.connector.Connectors;
import org.fao.fenix.commons.search.dto.filter.Filter;
import org.fao.fenix.commons.search.dto.Response;
import org.fao.fenix.commons.search.dto.resource.Resource;
import org.fao.fenix.catalog.processing.Processor;

import javax.inject.Inject;
import java.util.Collection;

public class BasicSearch {
    @Inject Processor logics;
    @Inject Connectors connectors;


    //Search flow
    public Response search (Filter filter) throws Exception {
        connectors.init(filter.getFilter().getTypes());
        logics.init(filter.getBusiness());

        Response response = new Response();
        for (Connector connector : connectors.getConnectors())
            response.addResources(connector.search(filter));

        return logics!=null ? logics.process(response) : response;
    }



/*        for (Connector connector : connectors.getConnectors()) {
            Collection<Resource> resources = connector.search(filter);
            if (resources != null)
                for (Resource resource : resources)
                    if ( (resource = logics!=null?logics.process(resource):resource) != null)
                        response.addResource(resource);
        }
*/
}
