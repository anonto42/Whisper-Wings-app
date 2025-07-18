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

const whisperUpload = z.object({
  body: z.object({
      whisperCoverImage: z.any({required_error: "You must give the image of the catagory"}),
      whisperName: z.string({ required_error:"Name is required"}),
      whisperDescription: z.string({ required_error:"Description is required"}),
      whisperCategory: z.string({ required_error:"Category is required"}),
      whisperSherpas: z.string({ required_error:"Sherpas is required"}),
      whisperAudioFile: z.any({ required_error:"Audio file is required"}),
  })
})

const whisperUpdate = z.object({
  body: z.object({
      id: z.string({ required_error:"Id is required"}),
      whisperCoverImage: z.any().optional(),
      whisperName: z.string().optional(),
      whisperDescription: z.string().optional(),
      whisperCategory: z.string().optional(),
      whisperSherpas: z.string().optional(),
      whisperAudioFile: z.any().optional(),
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
  whisperUpload,
  updateCatagory,
  whisperUpdate
}