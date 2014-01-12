package org.fao.fenix.catalog.search.impl;

import org.fao.fenix.catalog.connector.Connector;
import org.fao.fenix.catalog.connector.Connectors;
import org.fao.fenix.catalog.dto.*;
import org.fao.fenix.catalog.processing.Processor;
import org.fao.fenix.catalog.storage.dao.ConnectorDao;

import javax.enterprise.inject.Instance;
import javax.enterprise.inject.spi.CDI;
import javax.inject.Inject;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
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
                response.addResources(connector.search(filter).getResources().get(connectorsMapEntry.getKey()));
        }
        return response;
    }


}
