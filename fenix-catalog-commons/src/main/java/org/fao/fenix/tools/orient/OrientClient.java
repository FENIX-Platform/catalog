package org.fao.fenix.tools.orient;

import com.orientechnologies.orient.core.db.document.ODatabaseDocumentPool;
import com.orientechnologies.orient.core.db.document.ODatabaseDocumentTx;
import com.orientechnologies.orient.object.db.OObjectDatabasePool;
import com.orientechnologies.orient.object.db.OObjectDatabaseTx;
import org.fao.fenix.tools.utils.ClassUtils;
import org.fao.fenix.tools.utils.WebContext;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import java.util.*;

@ApplicationScoped
public class OrientClient {
    @Inject private WebContext webContext;
    @Inject private ClassUtils classUtils;

    private String url,usr,psw,pkg;
    private boolean initialized;

    //Init flow
    public void init() {
        Properties initProperties = webContext.getInitParameters();
        url = initProperties.getProperty("database.url","remote:localhost/fenix_catalog_1.0");
        usr = initProperties.getProperty("database.usr","admin");
        psw = initProperties.getProperty("database.psw","admin");
        pkg = initProperties.getProperty("database.entities.package","org.fao.fenix.catalog.storage.dto");

        destroyConnectionPool();
        initConnectionPool( Integer.parseInt(initProperties.getProperty("database.connections","100")));
        initialized = registerPersistentEntities();
    }
    public void destroy() {
        destroyConnectionPool();
    }

    private boolean registerPersistentEntities() {
        OObjectDatabaseTx connection = null;
        try {
            connection = objectPool.acquire(url, usr, psw);
            OrientClass annotation = null;
            for (Class c : classUtils.getClasses(pkg))
                if ((annotation= (OrientClass) c.getAnnotation(OrientClass.class))!=null)
                    connection.getEntityManager().registerEntityClass(c);
            return true;
        } catch (Exception e) {
            return false;
        } finally {
            if (connection!=null)
                connection.close();
        }
    }


    //Connection pool management
    private ODatabaseDocumentPool pool;
    private OObjectDatabasePool objectPool;
    private void initConnectionPool(int maxConnections) {
        maxConnections = Math.max(10,maxConnections);

        pool = new ODatabaseDocumentPool();
        pool.setup(10,maxConnections);
        objectPool = new OObjectDatabasePool();
        objectPool.setup(10,maxConnections);
    }
    private void destroyConnectionPool() {
        if (pool!=null) {
            pool.close();
            pool = null;
        }
        if (objectPool!=null) {
            objectPool.close();
            objectPool = null;
        }
    }


    //Connection management
    public ODatabaseDocumentTx getConnection() throws Exception {
        if (!initialized)
            init();
        try {
            return pool.acquire(url, usr, psw);
        } catch (Exception ex) {
            initialized = false;
            throw ex;
        }
    }

    public OObjectDatabaseTx getObjectConnection() throws Exception {
        if (!initialized)
            init();
        try {
            return objectPool.acquire(url, usr, psw);
        } catch (Exception ex) {
            initialized = false;
            throw ex;
        }
    }

}
