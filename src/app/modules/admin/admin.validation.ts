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
    whisperName: z.string({ required_error:"Name is required"}),
    whisperSherpas: z.string({ required_error:"Sherpas is required"}),
    whisperCategory: z.string({ required_error:"Category is required"}),
    whisperCoverImage: z.any({required_error: "You must give the image of the catagory"}),
  })
})

const whisperPartUpload = z.object({
  body: z.object({
    parent_id: z.string({ required_error: "Your must give your parent whisper id!"}),
    part: z.coerce.number({ required_error: "You must give the part of your whisper"}),
    EnglishFile: z.any({ required_error:"English file is required"}),
    DeutschFile: z.any({ required_error:"Deutsch file is required"}),
    FrancaisFile: z.any({ required_error:"Francais file is required"}),
    EspanolFile: z.any({ required_error:"Espanol file is required"}),
    EnglishLRC: z.any({ required_error:"English LRC is required"}),
    DeutschLRC: z.any({ required_error:"Deutsch LRC is required"}),
    FrancaisLRC: z.any({ required_error:"Francais LRC is required"}),
    EspanolLRC: z.any({ required_error:"Espanol LRC is required"}),
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

const subscriptionUpdate = z.object({
  body: z.object({
      id: z.string({ required_error:"Id is required"}),
      name: z.string().optional(),    
      price:  z.string().optional(),
      type: z.enum(['annually', 'monthly']).optional(),
      details: z.array(z.string({ required_error: "Details is required"})).optional()
  })  
})

const subscriptionUpload = z.object({
  body: z.object({
      name: z.string({ required_error:"Name is required"}),    
      price:  z.string({ required_error:"Price is required"}),
      type: z.enum(['annually', 'monthly']).optional(),
      details: z.array(z.string({ required_error: "Details is required"})).optional()
  })
})



export const AdminValidaton = {
  postUpload,
  sherpaUpload, 
  catagoryUpload,
  whisperUpload,
  updateCatagory,
  whisperUpdate,
  subscriptionUpload,
  subscriptionUpdate,
  whisperPartUpload
}