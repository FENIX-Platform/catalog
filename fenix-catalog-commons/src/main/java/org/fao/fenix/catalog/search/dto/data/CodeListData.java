package org.fao.fenix.catalog.search.dto.data;

import org.fao.fenix.catalog.search.dto.data.dsd.CodeListDSD;
import org.fao.fenix.catalog.search.dto.data.dsd.ResourceDSD;
import org.fao.fenix.catalog.search.dto.data.dsd.TableDSD;
import org.fao.fenix.msd.dto.cl.Code;
import org.fao.fenix.msd.dto.cl.CodeSystem;

import java.util.Collection;
import java.util.Map;

public class CodeListData extends StandardData {

    private CodeListDSD DSD;
    private Collection<Code> data;

    public CodeListData() { }
    public CodeListData(String name, String resourceType, String sourceName, Index index, CodeSystem metadata, CodeListDSD DSD, Collection<Code> data) {
        super(name,resourceType,sourceName,index,metadata,countCodes(data));

        if ((this.data = data)!=null)
            this.DSD = DSD!=null ? DSD : new CodeListDSD();
    }

    @Override
    public DataType getDataType() {
        return DataType.tree;
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
    private static int countCodes(Collection<Code> codes) {
        int count = 0;
        if (codes!=null) {
            count+=codes.size();
            for (Code code : codes)
                count+=countCodes(code.getChilds());
        }
        return count;
    }


}
