package org.fao.fenix.catalog.services.rest;

import org.fao.fenix.catalog.connector.Connector;
import org.fao.fenix.catalog.connector.Selector;
import org.fao.fenix.catalog.impl.TestImpl;

import javax.enterprise.context.RequestScoped;
import javax.enterprise.inject.Instance;
import javax.enterprise.inject.spi.CDI;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.Collection;

@Path("/test")
@Produces({MediaType.APPLICATION_JSON, MediaType.TEXT_HTML})
public class Test1 {

    @Inject TestImpl impl;
    @Inject Selector selector;
//    @Inject Collection<Connector> connectors;
    @Inject Instance<Collection<Connector>> connectorsInstance;

    @GET
    @Path("1")
    public String test() {
        return impl!=null ? impl.getMessage() : "<html><body><b>Implementation not found</b></body></html>";
    }

    @GET
    @Path("2")
    public String test2() {
        System.out.println("dentro: "+this);
        selector.setResourceType("dataset");
        System.out.println("type: "+selector.getResourceType()+" - "+selector);
        Collection<Connector> connectors = connectorsInstance.get();
        return "ok: "+connectors.size()+" - "+connectors.iterator().next();
    }

}
