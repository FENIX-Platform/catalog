package org.fao.fenix.catalog.processing;

import org.fao.fenix.catalog.search.dto.RequiredPlugin;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Produces;
import javax.enterprise.inject.spi.CDI;

@ApplicationScoped
public class Producer {

    @Produces
    public Process getProcessor(RequiredPlugin requiredPlugin) throws ClassNotFoundException {
        Process process = requiredPlugin==null ? null : CDI.current().select((Class<? extends Process>) Class.forName(requiredPlugin.getClassName())).get();
        if (process!=null)
            process.init(requiredPlugin.getProperties());
        return process;
    }
}
