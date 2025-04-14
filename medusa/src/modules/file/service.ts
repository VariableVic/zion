import {
  Logger,
  ProviderDeleteFileDTO,
  ProviderFileResultDTO,
  ProviderUploadFileDTO,
} from "@medusajs/framework/types";
import { AbstractFileProviderService } from "@medusajs/framework/utils";
import { createClient } from "@supabase/supabase-js"; // Import Supabase client

type InjectedDependencies = {
  logger: Logger;
};

type Options = {
  apiKey: string;
  supabaseUrl: string;
  bucketName: string;
};

class SupabaseFileProviderService extends AbstractFileProviderService {
  protected logger_: Logger;
  protected options_: Options;
  static identifier = "supabase-storage"; // Changed identifier for Supabase

  private supabase;

  constructor({ logger }: InjectedDependencies, options: Options) {
    super();
    this.logger_ = logger;
    this.options_ = options;

    // Initialize the Supabase client
    this.supabase = createClient(options.supabaseUrl, options.apiKey);
  }

  async createFiles(
    files: ProviderUploadFileDTO[]
  ): Promise<ProviderFileResultDTO[]> {
    return Promise.all(files.map(async (file) => this.upload(file)));
  }

  async upload(file: ProviderUploadFileDTO): Promise<ProviderFileResultDTO> {
    try {
      // Convert the binary string to a Buffer (Supabase can work directly with buffers)
      const buffer = Buffer.from(file.content, "base64");

      debugger;
      // Upload the file to the Supabase storage bucket
      const { data, error } = await this.supabase.storage
        .from(this.options_.bucketName) // Use bucket name from options
        .upload(file.filename, buffer, {
          contentType: file.mimeType,
          upsert: false, // Prevent overwriting existing files
        });

      if (error && error.statusCode !== "409") {
        console.error(error);
        throw error;
      }

      const fileUrl = this.supabase.storage
        .from(this.options_.bucketName)
        .getPublicUrl(file.filename).data.publicUrl;

      this.logger_.info(
        `File uploaded successfully to Supabase: ${file.filename}`
      );
      console.log(fileUrl);
      return {
        url: fileUrl,
        key: file.filename, // We use the filename as the key
      };
    } catch (error) {
      this.logger_.error(`Error uploading file to Supabase: ${error.message}`);
      throw error;
    }
  }

  async delete(file: ProviderDeleteFileDTO): Promise<void> {
    try {
      // Delete the file from Supabase storage
      const { error } = await this.supabase.storage
        .from(this.options_.bucketName)
        .remove([file.fileKey]);

      if (error) {
        throw error;
      }

      this.logger_.info(
        `File deleted successfully from Supabase: ${file.fileKey}`
      );
    } catch (error) {
      this.logger_.error(`Error deleting file from Supabase: ${error.message}`);
      throw error;
    }
  }
}

export default SupabaseFileProviderService;
