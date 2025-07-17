import { z } from "zod";

const postUpload = z.object({
  body: z.object({
      title: z.string({required_error: "You must give the title of the post"}),    
      description:  z.string({required_error: "description is required"}),
      image: z.any({required_error: "You must give the image of the post"})
  })
})

const sherpaUpload = z.object({
  body: z.object({
      id: z.string({ required_error:"Id is required"}),
      title: z.string().optional(),    
      description:  z.string().optional(),
      image: z.any().optional()
  })
})

const catagoryUpload = z.object({
  body: z.object({
      name: z.string({ required_error:"Name is required"}),    
      description:  z.string({ required_error:"Description is required"}),
      image: z.any({required_error: "You must give the image of the catagory"})
  })
})

const updateCatagory = z.object({
  body: z.object({
      id: z.string({ required_error:"Id is required"}),
      name: z.string().optional(),    
      description:  z.string().optional(),
      image: z.any().optional()
  })
})



export const AdminValidaton = {
  postUpload,
  sherpaUpload,
  catagoryUpload,
  updateCatagory
}