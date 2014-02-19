package org.fao.fenix.catalog.search.dto.data;

import org.fao.fenix.catalog.search.dto.data.dsd.ResourceDSD;
import org.fao.fenix.catalog.search.dto.data.dsd.TableDSD;
import org.fao.fenix.msd.dto.dm.DM;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

public class TableData extends StandardData {

    private TableDSD DSD;
    private Iterable<Object[]> data;

    public TableData() { }
    public TableData(String name, String resourceType, String sourceName, Index index, Object metadata, TableDSD DSD, Iterable<Object[]> data, Integer size) {
        super(name,resourceType,sourceName,index,metadata, size);

        if ((this.data = data)!=null)
            this.DSD = DSD!=null ? DSD : new TableDSD();
    }

    @Override
    public DataType getDataType() {
        return DataType.table;
    }

    @Override
    public Object getData() {
        return data;
    }

    @Override
    public ResourceDSD getDSD() {
        return DSD;
    }

    //Utils
    public void addColumn(String columnName, Map<String,Object> columnMetadata) {
        DSD.put(columnName, columnMetadata);
    }

}
