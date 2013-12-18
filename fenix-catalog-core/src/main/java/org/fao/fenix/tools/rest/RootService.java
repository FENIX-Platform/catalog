package org.fao.fenix.tools.rest;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

/**
 * Created by meco on 18/12/13.
 */
@Path("/")
public class RootService {

    @GET
    public String info() {
        return "<html><body><b>FENIX Catalog</b></body></html>";
    }

}
