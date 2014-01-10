package org.fao.fenix.catalog.processing;

import org.fao.fenix.catalog.dto.RequiredPlugin;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Produces;
import javax.enterprise.inject.spi.CDI;

@ApplicationScoped
public class Producer {

    @Produces
    public Process getProcessor(RequiredPlugin requiredPlugin) throws ClassNotFoundException {
        return CDI.current().select((Class<? extends Process>) Class.forName(requiredPlugin.getClassName())).get();
    }
}
