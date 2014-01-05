package org.fao.fenix.catalog.connector;

import org.fao.fenix.catalog.connector.dto.Filter;
import org.fao.fenix.catalog.connector.dto.Response;

import java.util.Map;
import java.util.Properties;

public interface Connector {

    public void init(Map<String,Object> properties);
    public Response search(Filter filter);

}
