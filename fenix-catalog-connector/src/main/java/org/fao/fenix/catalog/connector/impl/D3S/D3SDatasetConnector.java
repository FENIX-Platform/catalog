package org.fao.fenix.catalog.connector.impl.D3S;

import org.fao.fenix.catalog.connector.Connector;
import org.fao.fenix.catalog.connector.dto.Filter;
import org.fao.fenix.catalog.connector.dto.Response;

import javax.enterprise.context.ApplicationScoped;
import java.util.Properties;

@ApplicationScoped
public class D3SDatasetConnector implements Connector {
    @Override
    public void init(Properties parameters) {

    }

    @Override
    public Response search(Filter filter) {
        return null;
    }
}
