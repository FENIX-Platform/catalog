package org.fao.fenix.catalog.connector;

import org.fao.fenix.catalog.connector.dto.Filter;
import org.fao.fenix.catalog.connector.dto.Response;

import java.util.Properties;

public interface Connector {

    public void init(Properties parameters);
    public Response search(Filter filter);

}
