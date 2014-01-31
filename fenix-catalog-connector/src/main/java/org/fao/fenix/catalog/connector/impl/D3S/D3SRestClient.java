package org.fao.fenix.catalog.connector.impl.D3S;

import org.fao.fenix.msd.dto.cl.CodeSystem;
import org.fao.fenix.msd.services.spi.LoadCodeList;
import org.fao.fenix.tools.rest.RestClient;

import javax.enterprise.context.ApplicationScoped;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import java.util.Collection;

@ApplicationScoped
public class D3SRestClient extends RestClient {


    public CodeSystem getCodeList(String baseURL, String system, String version) throws Exception {
        Response response = getProxy(baseURL+'/'+system+'/'+version,LoadCodeList.class).getCodeList(null,system,version,true);
        switch (response.getStatus()) {
            case 200: return response.hasEntity() ? response.readEntity(CodeSystem.class) : null;
            case 204: return null;
            default: throw new Exception("HTTP connection error "+response.getStatus()+": "+(response.hasEntity() ? response.readEntity(String.class) : null));
        }
    }

}
