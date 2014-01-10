package org.fao.fenix.catalog.connector;

import org.fao.fenix.catalog.dto.Filter;
import org.fao.fenix.catalog.connector.impl.D3S.D3SDatasetConnector;
import org.fao.fenix.catalog.dto.Require;
import org.fao.fenix.catalog.dto.RequiredPlugin;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Produces;
import javax.enterprise.inject.spi.CDI;
import java.util.Arrays;
import java.util.Collection;

@ApplicationScoped
public class Producer {

    @Produces
    public Connector retrieveConnectors(RequiredPlugin requiredPlugin) throws ClassNotFoundException {
        return CDI.current().select((Class<? extends Connector>) Class.forName(requiredPlugin.getClassName())).get();
//        return (Connector)CDI.current().select(D3SDatasetConnector.class).get();
    }

}
