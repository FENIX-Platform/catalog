package org.fao.fenix.catalog.processing;

import org.fao.fenix.commons.search.dto.filter.RequiredPlugin;
import org.fao.fenix.commons.search.dto.Response;
import org.fao.fenix.commons.search.dto.resource.Resource;

import javax.enterprise.inject.Instance;
import javax.inject.Inject;
import java.util.LinkedList;
import java.util.Map;

public class Processor extends LinkedList<Process> implements Process {

    @Inject Instance<Process> processorFactory;
    @Inject RequiredPlugin requiredPlugin;

    //Init
    public void init(RequiredPlugin[] requiredPlugins) {
        if (requiredPlugins!=null)
            for (RequiredPlugin requiredPluginInfo : requiredPlugins) {
                requiredPlugin.copy(requiredPluginInfo);
                add(processorFactory.get());
            }
    }
    @Override public void init(Map<String, Object> initParameters) {}


    //Process flow
    @Override
    public Resource process(Resource resource) {
        for (Process p : this)
            resource = p.process(resource);
        return resource;
    }

    @Override
    public Response process(Response response) {
        for (Process p : this)
            response = p.process(response);
        return response;
    }
}
