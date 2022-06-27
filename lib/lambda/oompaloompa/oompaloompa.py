import crhelper
import boto3

helper = crhelper.CfnResource()

@helper.create
@helper.update
def get_account_factory_id(event, _):

	sc = boto3.client('servicecatalog')

	
	product_id = sc.search_products_as_admin(
		Filters={
			'FullTextSearch': ['AWS Control Tower Account Factory']
		},
	)['ProductViewDetails'][0]['ProductViewSummary']['ProductId']
	helper.Data['ProductId'] = product_id
	
	artifact_id = sc.describe_product_as_admin(
		Id = product_id
	)['ProvisioningArtifactSummaries'][0]['Id']
	helper.Data['ArtifactId'] = artifact_id
	
	
@helper.delete
def no_op(_, __):
	pass

def on_event( event, context ):
	helper(event, context)
