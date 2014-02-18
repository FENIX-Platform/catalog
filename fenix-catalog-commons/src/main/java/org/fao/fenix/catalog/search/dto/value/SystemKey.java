package org.fao.fenix.catalog.search.dto.value;

public class SystemKey implements Comparable<SystemKey> {

    private String system;
    private String version;

    public SystemKey() {}
    public SystemKey(String system, String version) {
        this.system = system;
        this.version = version;
    }

    public String getSystem() {
        return system;
    }

    public void setSystem(String system) {
        this.system = system;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }



    //Compare
    private String getKey() {
        return system!=null?system:""+'_'+version!=null?version:"";
    }

    @Override
    public int compareTo(SystemKey o) {
        return getKey().compareTo(o.getKey());
    }

    @Override
    public boolean equals(Object obj) {
        return obj instanceof SystemKey && getKey().equals(((SystemKey)obj).getKey());
    }

    @Override
    public int hashCode() {
        return getKey().hashCode();
    }
}
