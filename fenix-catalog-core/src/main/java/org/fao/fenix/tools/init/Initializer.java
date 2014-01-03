package org.fao.fenix.tools.init;

import org.fao.fenix.catalog.connector.Connector;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;

@WebServlet(urlPatterns = "/", loadOnStartup = 1)
public class Initializer extends HttpServlet {

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
//        ClassLoader loader = this.getClass().getClassLoader();
//        org.apache.catalina.loader.WebappClassLoader tomcatLoader = (org.apache.catalina.loader.WebappClassLoader)loader;
//        tomcatLoader.addRepository("file:///home/meco/Develop/Progetti/FAO/Fenix/workspace/fenix-catalog-connector-test/target/fenix-catalog-connector-test-1.0-SNAPSHOT.jar");

    }
}
