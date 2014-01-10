package org.fao.fenix.catalog.search.impl;

import org.fao.fenix.catalog.connector.Connector;
import org.fao.fenix.catalog.dto.RequiredPlugin;
import org.fao.fenix.catalog.storage.dao.ConnectorDao;

import javax.enterprise.inject.Instance;
import javax.inject.Inject;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

public class BasicSearch {

    @Inject ConnectorDao connectorDao;

    @Inject Instance<Connector> connectorFactory;
    @Inject Instance<org.fao.fenix.catalog.processing.Process> processorFactory;
    @Inject RequiredPlugin requiredPlugin;

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

    public org.fao.fenix.catalog.processing.Process processorFactory(RequiredPlugin requiredPluginInfo) {
        requiredPlugin.copy(requiredPluginInfo);
        return processorFactory.get();
    }

    public Collection<org.fao.fenix.catalog.processing.Process> processorFactory(Collection<RequiredPlugin> requiredPlugins) {
        Collection<org.fao.fenix.catalog.processing.Process> processors = new LinkedList<>();
        if (requiredPlugins!=null)
            for (RequiredPlugin requiredPluginInfo : requiredPlugins)
                processors.add(processorFactory(requiredPluginInfo));
        return processors;
    }


}
