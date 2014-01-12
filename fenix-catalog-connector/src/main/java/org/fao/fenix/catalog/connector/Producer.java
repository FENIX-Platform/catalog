package org.fao.fenix.catalog.connector;

import org.fao.fenix.catalog.search.dto.RequiredPlugin;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Produces;
import javax.enterprise.inject.spi.CDI;

@ApplicationScoped
public class Producer {

    @Produces
    public Connector retrieveConnectors(RequiredPlugin requiredPlugin) throws ClassNotFoundException {
        Connector connector = requiredPlugin==null ? null : CDI.current().select((Class<? extends Connector>) Class.forName(requiredPlugin.getClassName())).get();
        if (connector!=null)
            connector.init(requiredPlugin.getProperties());
        return connector;
//        return (Connector)CDI.current().select(D3SDatasetConnector.class).get();
    }

}
