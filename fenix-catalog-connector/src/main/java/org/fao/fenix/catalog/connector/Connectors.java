package org.fao.fenix.catalog.connector;

import org.fao.fenix.catalog.search.dto.RequiredPlugin;
import org.fao.fenix.catalog.storage.dao.ConnectorDao;

import javax.enterprise.inject.Instance;
import javax.inject.Inject;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

public class Connectors extends HashMap<String,Collection<Connector>> {

    @Inject ConnectorDao connectorDao;

    @Inject RequiredPlugin requiredPlugin;
    @Inject Instance<Connector> connectorFactory;

    public void init(String[] resourceTypes) throws Exception {
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

    }
}
