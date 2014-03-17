package org.fao.fenix.catalog.tools.orient;

import com.orientechnologies.orient.core.db.document.ODatabaseDocumentTx;
import com.orientechnologies.orient.core.query.OQuery;
import com.orientechnologies.orient.core.record.impl.ODocument;
import com.orientechnologies.orient.core.sql.query.OSQLSynchQuery;
import com.orientechnologies.orient.object.db.OObjectDatabaseTx;

import javax.inject.Inject;
import java.util.Collection;
import java.util.Iterator;

public abstract class OrientDao {
    @Inject OrientClient client;

    public static <T> OQuery<T> createSelect(String query, Class<T> type) {
        return new OSQLSynchQuery<T>(query);
    }

    public synchronized Collection<ODocument> select(OQuery<ODocument> query, Object... params) throws Exception {
        ODatabaseDocumentTx connection = null;
        try {
            query.reset();
            if (query instanceof OSQLSynchQuery)
                ((OSQLSynchQuery)query).resetPagination();
            return (Collection<ODocument>)(connection = client.getConnection()).query(query,params);
        } finally {
            if (connection!=null)
                connection.close();
        }
    }

    public synchronized <T> Collection<T> selectObject(OQuery<T> query, Object... params) throws Exception {
        OObjectDatabaseTx connection = null;
        try {
            query.reset();
            if (query instanceof OSQLSynchQuery)
                ((OSQLSynchQuery)query).resetPagination();
            return (Collection<T>)(connection = client.getObjectConnection()).query(query,params);
        } finally {
            if (connection!=null)
                connection.close();
        }
    }

    public synchronized Iterator<ODocument> browse(String className) throws Exception {
        ODatabaseDocumentTx connection = null;
        try {
            return (connection = client.getConnection()).browseClass(className);
        } finally {
            if (connection!=null)
                connection.close();
        }
    }

    public <T> Iterator<T> browseObject(Class<T> type) throws Exception {
        OObjectDatabaseTx connection = null;
        try {
            return (connection = client.getObjectConnection()).browseClass(type);
        } finally {
            if (connection!=null)
                connection.close();
        }
    }






    //TODO aggiungere utilities per il salvataggio e l'aggiornamneto delle informazioni
}
