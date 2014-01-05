package org.fao.fenix.catalog.storage.services.rest;

import org.fao.fenix.catalog.storage.dao.ConnectorDao;
import org.fao.fenix.catalog.storage.dto.Connector;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Collection;


@Path("/storage/connector")
@Produces(MediaType.APPLICATION_JSON + "; charset=UTF-8")
public class ConnectorService {
    @Inject ConnectorDao dao;

    @GET
    public Response getConnectorsByResourceType(@Context HttpServletRequest request, @QueryParam("resourceType") String resourceType) {
        try {
            Collection<Connector> result = resourceType!=null && !resourceType.trim().equals("") ? dao.connectorsByResourceType(resourceType) : dao.connectors();
            return result!=null && result.size()>0 ? Response.ok(result).build() : Response.noContent().build();
        } catch (Throwable e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
    }
}
