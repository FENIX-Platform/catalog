package org.fao.fenix.catalog.storage.dao;

import com.orientechnologies.orient.core.query.OQuery;
import com.orientechnologies.orient.core.record.impl.ODocument;
import org.fao.fenix.catalog.storage.dto.Connector;
import org.fao.fenix.tools.orient.OrientDao;

import javax.enterprise.context.ApplicationScoped;
import java.util.Collection;
import java.util.Iterator;
import java.util.LinkedList;

@ApplicationScoped
public class ConnectorDao extends OrientDao {
    private static OQuery<ODocument> queryConnectorsDocByResourceType = createSelect("select from Connector where plugin.component = 'fenix-catalog-connector-1.0' and resourceType.type = ?",ODocument.class);
    private static OQuery<Connector> queryConnectorsByResourceType = createSelect("select from Connector where plugin.component = 'fenix-catalog-connector-1.0' and resourceType.type = ?", Connector.class);

    public Collection<ODocument> connectorsDocByResourceType(String resourceType) throws Exception {
        return select(queryConnectorsDocByResourceType, resourceType);
    }
    public Collection<Connector> connectorsByResourceType(String resourceType) throws Exception {
        return selectObject(queryConnectorsByResourceType, resourceType);
    }

    public Iterator<ODocument> connectorsDoc() throws Exception {
        return browse(Connector.class.getSimpleName());
    }
    public Collection<Connector> connectors() throws Exception {
        Collection<Connector> connectors = new LinkedList<Connector>();
        for (Iterator<Connector> i=browseObject(Connector.class); i.hasNext(); connectors.add(i.next()));
        return connectors;
    }
}
