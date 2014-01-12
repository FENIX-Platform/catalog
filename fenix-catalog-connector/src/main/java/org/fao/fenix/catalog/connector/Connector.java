package org.fao.fenix.catalog.connector;

import org.fao.fenix.catalog.search.dto.Filter;
import org.fao.fenix.catalog.search.dto.data.Resource;

import java.util.Collection;
import java.util.Map;

public interface Connector {

    public void init(Map<String,Object> properties);
    public Collection<Resource> search(Filter filter);

}
