package org.fao.fenix.catalog.search.services.rest;

import org.fao.fenix.catalog.search.dto.Filter;
import org.fao.fenix.catalog.search.impl.BasicSearch;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;

@Path("/search")
public class SearchService {

    @Inject BasicSearch finder;

    @POST
    public Response findResources(@Context HttpServletRequest request, Filter filter) {
        try {
            org.fao.fenix.catalog.search.dto.Response result = finder.search(filter);
            return result!=null && result.getCount()>0 ? Response.ok(result).build() : Response.noContent().build();
        } catch (Throwable e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
    }

}
