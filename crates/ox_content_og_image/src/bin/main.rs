use std::io::{self, Write};
use std::path::PathBuf;

use bpaf::Bpaf;
use ox_content_og_image::{OgImageConfig, OgImageData, OgImageGenerator};

#[derive(Debug, Clone, Bpaf)]
#[bpaf(options, version, descr("Generate OG image SVG"))]
struct CliArgs {
    #[bpaf(short, long, argument("PATH"))]
    output: Option<PathBuf>,
    
    #[bpaf(long, argument("TEXT"))]
    title: String,
    
    #[bpaf(long, argument("TEXT"))]
    description: Option<String>,
    
    #[bpaf(long, argument("TEXT"))]
    site_name: Option<String>,
    
    #[bpaf(long, argument("TEXT"))]
    author: Option<String>,
    
    #[bpaf(long, argument("TEXT"))]
    date: Option<String>,
    
    #[bpaf(long("tag"), argument("TEXT"), many)]
    tags: Vec<String>,
    
    #[bpaf(long, argument("PX"))]
    width: Option<u32>,
    
    #[bpaf(long, argument("PX"))]
    height: Option<u32>,
    
    #[bpaf(long, argument("HEX"))]
    background: Option<String>,
    
    #[bpaf(long, argument("HEX"))]
    text_color: Option<String>,
    
    #[bpaf(long("title-size"), argument("PX"))]
    title_size: Option<u32>,
    
    #[bpaf(long("description-size"), argument("PX"))]
    description_size: Option<u32>,
    
    #[bpaf(long, argument("NAME"))]
    font_family: Option<String>,
    
    #[bpaf(long, argument("PATH"))]
    logo_path: Option<String>,
}

fn main() {
    if let Err(error) = run() {
        let _ = io::stderr().write_all(format!("error: {error}\n").as_bytes());
        std::process::exit(1);
    }
}

fn run() -> Result<(), String> {
    let args = cli_args().run();

    let mut config = OgImageConfig::default();
    if let Some(width) = args.width {
        config.width = width;
    }
    if let Some(height) = args.height {
        config.height = height;
    }
    if let Some(background) = args.background {
        config.background_color = background;
    }
    if let Some(text_color) = args.text_color {
        config.text_color = text_color;
    }
    if let Some(title_size) = args.title_size {
        config.title_font_size = title_size;
    }
    if let Some(description_size) = args.description_size {
        config.description_font_size = description_size;
    }
    if let Some(font_family) = args.font_family {
        config.font_family = Some(font_family);
    }
    if let Some(logo_path) = args.logo_path {
        config.logo_path = Some(logo_path);
    }

    let data = OgImageData {
        title: args.title,
        description: args.description,
        site_name: args.site_name,
        author: args.author,
        date: args.date,
        tags: args.tags,
    };

    let generator = OgImageGenerator::new(config);
    let svg = generator.generate_svg(&data);

    if let Some(output) = args.output {
        std::fs::write(&output, svg.as_bytes())
            .map_err(|err| format!("failed to write {}: {err}", output.display()))?;
    } else {
        let mut stdout = io::stdout();
        stdout
            .write_all(svg.as_bytes())
            .map_err(|err| format!("failed to write svg: {err}"))?;
    }

    Ok(())
}
