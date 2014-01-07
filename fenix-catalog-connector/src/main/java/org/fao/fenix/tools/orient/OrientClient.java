package org.fao.fenix.tools.orient;

import com.orientechnologies.orient.core.db.document.ODatabaseDocumentPool;
import com.orientechnologies.orient.core.db.document.ODatabaseDocumentTx;
import com.orientechnologies.orient.object.db.OObjectDatabasePool;
import com.orientechnologies.orient.object.db.OObjectDatabaseTx;
import org.fao.fenix.tools.utils.ClassUtils;

import javax.enterprise.context.ApplicationScoped;
import java.util.*;

@ApplicationScoped
public class OrientClient {
    private static String url,usr,psw,pkg;

    public static void init(Properties initProperties) {
        url = initProperties.getProperty("database.url","remote:localhost/fenix_catalog_1.0");
        usr = initProperties.getProperty("database.usr","admin");
        psw = initProperties.getProperty("database.psw","admin");
        pkg = initProperties.getProperty("database.entities.package","org.fao.fenix.catalog.storage.dto");
        initConnectionPool( Integer.parseInt(initProperties.getProperty("database.connections","100")));
    }
    public static void destroy() {
        destroyConnectionPool();
    }


    //Connection pool management
    private static ODatabaseDocumentPool pool;
    private static OObjectDatabasePool objectPool;
    private static void initConnectionPool(int maxConnections) {
        if (maxConnections==0)
            maxConnections=1;
        int minConnections = Math.min(10,maxConnections);

        pool = new ODatabaseDocumentPool();
        pool.setup(minConnections,maxConnections);
        objectPool = new OObjectDatabasePool();
        objectPool.setup(minConnections,maxConnections);

        registerPersistentObjects();
    }
    private static void destroyConnectionPool() {
        pool.close();
        pool = null;
        objectPool.close();
        objectPool = null;
    }

    private static void registerPersistentObjects() {
        OObjectDatabaseTx connection = null;
        try {
            connection = objectPool.acquire(url, usr, psw);
            OrientClass annotation = null;
            //for (Class c : ClassUtils.getClasses(OrientClient.class.getClassLoader(), pkg))
            for (Class c : ClassUtils.getClasses(pkg))
                if ((annotation= (OrientClass) c.getAnnotation(OrientClass.class))!=null)
                    connection.getEntityManager().registerEntityClass(c);
        } catch (Exception e) {
            e.printStackTrace(); //Ignore
        } finally {
            if (connection!=null)
                connection.close();
        }
    }

    public ODatabaseDocumentTx getConnection() {
        return pool.acquire(url, usr, psw);
    }
    public OObjectDatabaseTx getObjectConnection() {
        return objectPool.acquire(url, usr, psw);
    }

}
