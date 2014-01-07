package org.fao.fenix.catalog.connector;

import org.fao.fenix.catalog.dto.Filter;
import org.fao.fenix.catalog.connector.impl.D3S.D3SDatasetConnector;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Produces;
import javax.enterprise.inject.spi.CDI;
import java.util.Arrays;
import java.util.Collection;

@ApplicationScoped
public class Producer {

    @Produces
    public Collection<Connector> retrieveConnectors(Filter filter) {
        System.out.println("type: " + filter.getResourceType() + " - " + filter);
        return Arrays.asList((Connector)CDI.current().select(D3SDatasetConnector.class).get());
    }

}
