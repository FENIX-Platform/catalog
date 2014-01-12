package org.fao.fenix.catalog.connector.impl.D3S;

import org.fao.fenix.catalog.connector.Connector;
import org.fao.fenix.catalog.search.dto.Filter;
import org.fao.fenix.catalog.search.dto.data.Resource;

import javax.enterprise.context.ApplicationScoped;
import java.util.Collection;
import java.util.Map;

@ApplicationScoped
public class D3SDatasetConnector implements Connector {
    @Override
    public void init(Map<String,Object> properties) {

    }

    @Override
    public Collection<Resource> search(Filter filter) {
        return null;
    }
}
