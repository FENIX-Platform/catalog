package org.fao.fenix.catalog.connector;

import org.fao.fenix.catalog.dto.Filter;
import org.fao.fenix.catalog.dto.Response;

import java.util.Map;
import java.util.Properties;

public interface Connector {

    public void init(Map<String,Object> properties);
    public Response search(Filter filter);

}
