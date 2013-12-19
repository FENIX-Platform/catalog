package org.fao.fenix.catalog.services.rest;

import org.fao.fenix.catalog.impl.TestImpl;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/test1")
@Produces({MediaType.APPLICATION_JSON, MediaType.TEXT_HTML})
public class Test1 {

    @Inject TestImpl impl;

    @GET
    public String test() {
        return impl!=null ? impl.getMessage() : "<html><body><b>Implementation not found</b></body></html>";
    }

}
