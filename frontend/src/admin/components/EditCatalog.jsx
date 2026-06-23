import React, { useCallback, useEffect, useState } from "react";
import ProducutsForm from "./ProducutsForm";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../axios/api";
import toast from "react-hot-toast";

const EditCatalog = () => {
  const { id } = useParams();
  const [product , setProduct] = useState(null);
  const [isLoading , setLoading] = useState(false);
  const fetchProduct = useCallback(async ()=>{
     try {
       setLoading(true);
       const respose = await api.get(`/products/${id}`);
       const data = respose.data
       setProduct(data)
       setLoading(false);
     } catch (error) {
       setLoading(false);
       toast.error(error.response.data.message|| error.message);
     }finally{
      setLoading(false);
     }
  },[id])

  useEffect(()=>{
    if(id){
      fetchProduct()
    }
  },[id])

  return (
    <div>
      <ProducutsForm
        isEdit={true}
        onLoad={isLoading}
        catalogData={product}
      />
    </div>
  );
};

export default EditCatalog;
