package org.fao.fenix.tools.init;

import org.fao.fenix.tools.utils.FileUtils;
import org.fao.fenix.tools.utils.WebContext;

import javax.enterprise.context.ApplicationScoped;
import javax.servlet.*;
import javax.servlet.annotation.WebListener;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@WebListener
@ApplicationScoped
public class Initializer implements ServletContextListener, WebContext {

//        ClassLoader loader = this.getClass().getClassLoader();
//        org.apache.catalina.loader.WebappClassLoader tomcatLoader = (org.apache.catalina.loader.WebappClassLoader)loader;
//        tomcatLoader.addRepository("file:///home/meco/Develop/Progetti/FAO/Fenix/workspace/fenix-catalog-connector-test/target/fenix-catalog-connector-test-1.0-SNAPSHOT.jar");

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        context = servletContextEvent.getServletContext();
        for (Object key : Collections.list(context.getInitParameterNames()))
            initParameters.setProperty((String)key, context.getInitParameter((String)key));
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        context = null;
        initParameters.clear();
    }


    //Utils
    private static Properties initParameters = new Properties();
    @Override public Properties getInitParameters() { return initParameters; }
    @Override public String getInitParameter(String key) { return initParameters.getProperty(key); }

    private static ServletContext context;
    @Override public InputStream getWebrootFileStream(String path) throws IOException { return context.getResourceAsStream(path); }
}
