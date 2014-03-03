package org.fao.fenix.catalog.search.services.rest;

import org.fao.fenix.catalog.search.dto.Filter;
import org.fao.fenix.catalog.search.dto.resource.index.Index;
import org.fao.fenix.catalog.search.dto.resource.index.IndexType;
import org.fao.fenix.catalog.search.dto.resource.data.TableData;
import org.fao.fenix.catalog.search.dto.resource.dsd.TableDSD;
import org.fao.fenix.catalog.search.impl.BasicSearch;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

@Path("/search")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
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

    @POST
    @Path("test")
    public Response findResourcesTest(@Context HttpServletRequest request, Filter filter) {
        try {
            return Response.ok(createFakeResponse()).build();
        } catch (Throwable e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
    }

    private static org.fao.fenix.catalog.search.dto.Response createFakeResponse() {
        org.fao.fenix.catalog.search.dto.Response response = new org.fao.fenix.catalog.search.dto.Response();

        Map<String,String> label;
        Map<String,Object> column;
        Map<String,Object> values;
        Map<String,Object> value;

        String name = "dataset 1";
        String resourceType = "dataset";
        String sourceName = "CountrySTAT";
        Index index = new Index(IndexType.http,new HashMap<String, Object>());
        index.getProperties().put("url","http://test.url");
        index.getProperties().put("method","GET");
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("title",label = new HashMap<>());
        label.put("EN","Test dataset 1");
        label.put("IT","Dataset di test 1");
        metadata.put("creationDate", new Date());
        TableDSD DSD = new TableDSD();
        DSD.put("TIME", column = new HashMap<String, Object>());
        column.put("title", label = new HashMap<>());
        label.put("EN","Year");
        label.put("IT","Anno");
        column.put("values", new int[]{2010,2012});
        DSD.put("ITEM", column = new HashMap<String, Object>());
        column.put("title", label = new HashMap<>());
        label.put("EN","Commodity");
        label.put("IT","Prodotto");
        column.put("values", values = new HashMap<>());
        values.put("100", value = new HashMap<>());
        value.put("title", label = new HashMap<>());
        label.put("EN","Rice");
        label.put("IT","Riso");
        values.put("101", value = new HashMap<>());
        value.put("title", label = new HashMap<>());
        label.put("EN","Wheat");
        label.put("IT","Grano");
        DSD.put("VALUE", column = new HashMap<String, Object>());
        column.put("title", label = new HashMap<>());
        label.put("EN","Value");
        label.put("IT","Valore");

        LinkedList<Object[]> data = new LinkedList<>();
        data.add(new Object[]{2010,"100",1500});
        data.add(new Object[]{2012,"100",1800});
        data.add(new Object[]{2010,"101",10589});
        data.add(new Object[]{2012,"101",12777});

        Integer size = 4;

        response.addResource(new TableData(name, resourceType, sourceName,index,metadata,DSD,data,size));

        //////////

        name = "dataset 2";
        resourceType = "dataset";
        sourceName = "CountrySTAT";
        index = new Index(IndexType.http,new HashMap<String, Object>());
        index.getProperties().put("url","http://test2.url");
        index.getProperties().put("method","POST");
        metadata = new HashMap<>();
        metadata.put("title",label = new HashMap<>());
        label.put("EN","Test dataset 2");
        label.put("IT","Dataset di test 2");
        metadata.put("creationDate", new Date());
        DSD = new TableDSD();
        DSD.put("TIME", column = new HashMap<String, Object>());
        column.put("title", label = new HashMap<>());
        label.put("EN","Year");
        label.put("IT","Anno");
        column.put("values", new int[]{2011,2013});
        DSD.put("ITEM", column = new HashMap<String, Object>());
        column.put("title", label = new HashMap<>());
        label.put("EN","Commodity");
        label.put("IT","Prodotto");
        column.put("values", values = new HashMap<>());
        values.put("200", value = new HashMap<>());
        value.put("title", label = new HashMap<>());
        label.put("EN","Corn");
        label.put("IT","Mais");
        values.put("201", value = new HashMap<>());
        value.put("title", label = new HashMap<>());
        label.put("EN","Bean");
        label.put("IT","Fagioli");
        DSD.put("VALUE", column = new HashMap<String, Object>());
        column.put("title", label = new HashMap<>());
        label.put("EN","Value");
        label.put("IT","Valore");

        data = new LinkedList<>();
        data.add(new Object[]{2011,"200",2500});
        data.add(new Object[]{2013,"200",2800});
        data.add(new Object[]{2011,"201",20589});
        data.add(new Object[]{2013,"201",22777});

        size = 4;

        response.addResource(new TableData(name, resourceType, sourceName,index,metadata,DSD,data,size));

        //////////////////

        return response;
    }

}
