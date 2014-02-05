package org.fao.fenix.catalog.connector;

import org.fao.fenix.catalog.search.dto.RequiredPlugin;
import org.fao.fenix.catalog.storage.dao.ConnectorDao;

import javax.enterprise.context.RequestScoped;
import javax.enterprise.inject.Instance;
import javax.inject.Inject;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

public class Connectors {

    @Inject ConnectorDao connectorDao;

    @Inject RequiredPlugin requiredPlugin;
    @Inject Instance<Connector> connectorFactory;

    private Map<String,Collection<Connector>> connectorMap = new HashMap<String,Collection<Connector>>();

    public void init(String[] resourceTypes) throws Exception {
        if (resourceTypes!=null)
            for (String resourceType : resourceTypes) {
                Collection<Connector> connectors = new LinkedList<>();
                for (org.fao.fenix.catalog.storage.dto.Connector connectorInfo : connectorDao.connectorsByResourceType(resourceType)) {
                    Map<String,Object> properties = new HashMap<>();
                    properties.putAll(connectorInfo.getSource().getConnectionProperties());
                    properties.put("sourceName",connectorInfo.getSource().getName());
                    //RequiredPlugin requiredPlugin = requiredPluginFactory.get();
                    requiredPlugin.setClassName(connectorInfo.getPlugin().getClassName());
                    requiredPlugin.setProperties(properties);
                    connectors.add(connectorFactory.get());
                }
                connectorMap.put(resourceType,connectors);
            }
    }

    public Map<String,Collection<Connector>> getConnectorMap() {
        return connectorMap;
    }
}
