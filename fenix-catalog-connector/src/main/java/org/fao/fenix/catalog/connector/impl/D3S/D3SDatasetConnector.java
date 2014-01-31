package org.fao.fenix.catalog.connector.impl.D3S;

import org.fao.fenix.catalog.connector.Connector;
import org.fao.fenix.catalog.search.dto.Filter;
import org.fao.fenix.catalog.search.dto.data.Resource;
import org.fao.fenix.msd.dto.cl.CodeSystem;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import java.util.Collection;
import java.util.Map;

@ApplicationScoped
public class D3SDatasetConnector implements Connector {

    @Inject private D3SRestClient dao;
    private String baseURL;

    @Override
    public void init(Map<String,Object> properties) {
        baseURL = (String)properties.get("url");
    }

    @Override
    public Collection<Resource> search(Filter filter) {
        try {
            CodeSystem cl = dao.getCodeList(baseURL,"FAO_Languages","1.0");
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
