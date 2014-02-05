package org.fao.fenix.catalog.connector;

import org.fao.fenix.catalog.search.dto.RequiredPlugin;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.context.RequestScoped;
import javax.enterprise.inject.Produces;
import javax.enterprise.inject.spi.CDI;
import java.lang.annotation.Annotation;

@ApplicationScoped
public class Producer {

    @Produces
    public Connector retrieveConnectors(RequiredPlugin requiredPlugin) throws ClassNotFoundException {
        Connector connector = null;
        try {
        connector = requiredPlugin==null ? null :   CDI.current().select(
                                                        (Class<? extends Connector>) Class.forName(requiredPlugin.getClassName()),
                                                        new ConnectorImplementation() { @Override public Class<? extends Annotation> annotationType() { return ConnectorImplementation.class; } }
                                                    ).get();
        } catch (Exception e) {
            e.printStackTrace();
        }
        if (connector!=null)
            connector.init(requiredPlugin.getProperties());
        return connector;
    }

}
