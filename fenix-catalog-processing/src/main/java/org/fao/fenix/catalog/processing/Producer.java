package org.fao.fenix.catalog.processing;

import org.fao.fenix.catalog.dto.RequiredProcess;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Produces;

@ApplicationScoped
public class Producer {

    @Produces
    public Process getProcessor(RequiredProcess processInfo) {
        //Verify plugin (optional)
        //Get instance by name

        return null; //TODO
    }
}
