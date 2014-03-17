package org.fao.fenix.catalog.tools.rest;

import java.util.Map;

import javax.ws.rs.client.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.jboss.resteasy.client.jaxrs.ResteasyClientBuilder;


public class RestClient {

	public static enum HTTPMethod {GET,POST,PUT,DELETE}


    //Utils methods
    public <T> T get(String baseURL, Map<String,Object> pathParams, Map<String,Object> queryParams, Class<T> returnType, Map<String,Object> headerParams) throws Exception {
        return request(HTTPMethod.GET, baseURL, pathParams, queryParams, null, returnType, null, null, headerParams);
    }
    public void post(String baseURL, Map<String,Object> pathParams, Map<String,Object> queryParams, Object body, MediaType sendProtocol, Map<String,Object> headerParams) throws Exception {
        request(HTTPMethod.POST, baseURL, pathParams, queryParams, body, sendProtocol, null, headerParams);
    }
    public void put(String baseURL, Map<String,Object> pathParams, Map<String,Object> queryParams, Object body, MediaType sendProtocol, Map<String,Object> headerParams) throws Exception {
        request(HTTPMethod.PUT, baseURL, pathParams, queryParams, body, sendProtocol, null, headerParams);
    }
    public void delete(String baseURL, Map<String,Object> pathParams, Map<String,Object> queryParams, Map<String,Object> headerParams) throws Exception {
        request(HTTPMethod.DELETE, baseURL, pathParams, queryParams, null, null, null, headerParams);
    }


	//Standard request methods
    public <T> T request(HTTPMethod httpMethod, String baseURL, Map<String,Object> pathParams, Map<String,Object> queryParams, Object body, Class<T> returnType, MediaType sendProtocol, MediaType[] receiveProtocols, Map<String,Object> headerParams) throws Exception {
        Response response = null;
        try {
            response = request(httpMethod, baseURL, pathParams, queryParams, body, sendProtocol, receiveProtocols, headerParams);
            if (response.getStatus()!=200)
                throw new Exception("Connection error: ("+response.getStatus()+") "+(response.hasEntity()?response.getEntity():""));
            return returnType!=null && response.hasEntity() ? response.readEntity(returnType) : null;
        } finally {
            if (response!=null)
                response.close();
        }
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    public Response request(HTTPMethod httpMethod, String baseURL, Map<String,Object> pathParams, Map<String,Object> queryParams, Object body, MediaType sendProtocol, MediaType[] receiveProtocols, Map<String,Object> headerParams) throws Exception {
        assert baseURL!=null && httpMethod!=null;
        assert body==null || sendProtocol!=null;

        if (pathParams!=null)
            for (Map.Entry<String,Object> param : pathParams.entrySet())
                baseURL = baseURL.replace('{'+param.getKey()+'}', param.getValue().toString());

        Client client = ClientBuilder.newBuilder().build();
        WebTarget target = client.target(baseURL);
        Invocation.Builder requestBuilder = target.request();

        if (queryParams!=null)
            for (Map.Entry<String,Object> param : queryParams.entrySet())
                target.queryParam(param.getKey(), param.getValue());

        if (receiveProtocols!=null)
            requestBuilder.accept(receiveProtocols);

        if (headerParams!=null)
            for (Map.Entry<String,Object> param : headerParams.entrySet())
                requestBuilder.header(param.getKey(), param.getValue());

        return requestBuilder.method(httpMethod.name(), body!=null ? Entity.entity(body,sendProtocol) : null);
    }


    //Proxy methodology
    public <T> T getProxy(String baseURL, Class<T> serviceInterfaceClass) {
        return new ResteasyClientBuilder().build().target(baseURL).proxy(serviceInterfaceClass);
    }

}
