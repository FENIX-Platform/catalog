package org.fao.fenix.catalog.services.rest;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

@Path("/test1")
public class Test1 {

    @GET
    public String test() {
        return "<html><body><b>Test service</b></body></html>";
    }

}
