package org.fao.fenix.tools.init;

import org.fao.fenix.tools.orient.OrientClient;

import javax.inject.Inject;
import javax.servlet.*;
import javax.servlet.annotation.WebListener;
import java.io.File;
import java.util.*;

@WebListener
public class Initializer implements ServletContextListener {

//        ClassLoader loader = this.getClass().getClassLoader();
//        org.apache.catalina.loader.WebappClassLoader tomcatLoader = (org.apache.catalina.loader.WebappClassLoader)loader;
//        tomcatLoader.addRepository("file:///home/meco/Develop/Progetti/FAO/Fenix/workspace/fenix-catalog-connector-test/target/fenix-catalog-connector-test-1.0-SNAPSHOT.jar");

    @Inject OrientClient orientClient;


    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        ServletContext context = servletContextEvent.getServletContext();
        for (String key : Collections.list(context.getInitParameterNames()))
            initParameters.setProperty(key,context.getInitParameter(key));
//        webRootPath = new File(context.getRealPath("./"));

        init();
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        destroy();
    }


    //Init flow
    private void init() {
        OrientClient.init(initParameters);
    }
    //Destroy flow
    private void destroy() {
        OrientClient.destroy();
    }


    //Utils
    private File webRootPath;
    private Properties initParameters = new Properties();
    public File getWebRootPath() { return webRootPath; }
    public Properties getInitParameters() { return initParameters; }
    public String getInitParameter(String key) { return initParameters.getProperty(key); }
}
