package org.fao.fenix.catalog.connector;

import org.fao.fenix.commons.search.dto.filter.RequiredPlugin;
import org.fao.fenix.catalog.storage.dao.ConnectorDao;

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

    private Collection<Connector> connectors;

    public void init(String[] resourceTypes) throws Exception {
        if (resourceTypes!=null) {
            connectors = new LinkedList<>();
            for (org.fao.fenix.catalog.storage.dto.Connector connectorInfo : connectorDao.connectorsByResourceType(resourceTypes)) {
                Map<String,Object> properties = new HashMap<>();
                properties.putAll(connectorInfo.getSource().getConnectionProperties());
                properties.put("sourceName",connectorInfo.getSource().getName());
                requiredPlugin.setClassName(connectorInfo.getPlugin().getClassName());
                requiredPlugin.setProperties(properties);
                connectors.add(connectorFactory.get());
            }
        }
    }

    public Collection<Connector> getConnectors() {
        return connectors;
    }
}
