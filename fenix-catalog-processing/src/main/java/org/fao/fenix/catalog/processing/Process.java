package org.fao.fenix.catalog.processing;

import org.fao.fenix.catalog.search.dto.Response;
import org.fao.fenix.catalog.search.dto.data.Resource;

import java.util.Map;

public interface Process {
    public void init (Map<String,Object> initParameters);
    public Resource process(Resource resource);
    public Response process(Response response);
}
