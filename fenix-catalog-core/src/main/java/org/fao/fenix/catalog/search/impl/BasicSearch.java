package org.fao.fenix.catalog.search.impl;

import org.fao.fenix.catalog.connector.Connector;
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

    @Inject ConnectorDao connectorDao;
    @Inject Instance<Connector> connectorFactory;
    @Inject RequiredPlugin requiredPlugin;

    @Inject Processor resourcesProcessor;
    @Inject Processor responseProcessor;


    //Search flow
    public Response search (Filter filter) throws Exception {
        Map<String,Collection<Connector>> connectorsMap = connectorFactory(filter.getFilter().getTypes());
        resourcesProcessor.init(filter.getFilter().getBusiness());
        responseProcessor.init(filter.getBusiness());

        Response response = new Response();
        for (Map.Entry<String,Collection<Connector>> connectorsMapEntry : connectorsMap.entrySet()) {
            filter.getFilter().setTypes(new String[]{connectorsMapEntry.getKey()});
            for (Connector connector : connectorsMapEntry.getValue())
                response.addResources(connector.search(filter).getResources().get(connectorsMapEntry.getKey()));
        }
        return response;
    }


    //Utils
    public Map<String,Collection<Connector>> connectorFactory(String[] resourceTypes) throws Exception {
        Map<String,Collection<Connector>> connectorMap = new HashMap<>();
        if (resourceTypes!=null)
            for (String resourceType : resourceTypes) {
                Collection<Connector> connectors = new LinkedList<>();
                for (org.fao.fenix.catalog.storage.dto.Connector connectorInfo : connectorDao.connectorsByResourceType(resourceType)) {
                    Map<String,Object> properties = new HashMap<>();
                    properties.putAll(connectorInfo.getSource().getConnectionProperties());
                    properties.put("sourceName",connectorInfo.getSource().getName());
                    requiredPlugin.setClassName(connectorInfo.getPlugin().getClassName());
                    requiredPlugin.setProperties(properties);
                    connectors.add(connectorFactory.get());
                }
                connectorMap.put(resourceType,connectors);
            }
        return connectorMap;
    }

    public void findPluginClass (RequiredPlugin[] requiredPlugins) {

    }



}
