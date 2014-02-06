package org.fao.fenix.catalog.connector.impl.D3S;

import org.fao.fenix.catalog.connector.Connector;
import org.fao.fenix.catalog.connector.ConnectorImplementation;
import org.fao.fenix.catalog.search.dto.Filter;
import org.fao.fenix.catalog.search.dto.data.Resource;
import org.fao.fenix.client.D3SClient;
import org.fao.fenix.msd.dto.cl.CodeSystem;
import org.fao.fenix.msd.services.spi.LoadCodeList;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Context;
import java.util.Collection;
import java.util.Map;

@ConnectorImplementation
@RequestScoped
public class D3SDatasetConnector extends D3SClient implements Connector {

    @Context private HttpServletRequest httpRequest;

    @Override
    public void init(Map<String,Object> properties) {
        initRest("http://localhost:8081/msd/cl");
        //initRest((String) properties.get("url"));
    }

    @Override
    public Collection<Resource> search(Filter filter) {
        try {
            CodeSystem cl = getProxy(LoadCodeList.class).getCodeList("FAO_Languages", "1.0", false);
            System.out.println("Letta la codifica: " + cl.getSystem());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
